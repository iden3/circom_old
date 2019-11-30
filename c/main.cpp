#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <iomanip>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <gmp.h>
#include <unistd.h>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

#include "calcwit.h"
#include "circom.h"
#include "utils.h"

#define handle_error(msg) \
           do { perror(msg); exit(EXIT_FAILURE); } while (0)

void loadBin(Circom_CalcWit *ctx, std::string filename) {
    int fd;
    struct stat sb;

    // map input
    fd = open(filename.c_str(), O_RDONLY);
    if (fd == -1)
        handle_error("open");

    if (fstat(fd, &sb) == -1)           /* To obtain file size */
        handle_error("fstat");


    u8 *in;

    in = (u8 *)mmap(NULL, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    if (in == MAP_FAILED)
        handle_error("mmap");

    close(fd);

    BigInt v;
    mpz_init2(v, 256);
    u8 *p = in;
    for (int i=0; i<_circuit.NInputs; i++) {
        int len = *(u8 *)p;
        p++;
        mpz_import(v,len , -1 , 1, 0, 0, p);
        p+=len;
        ctx->setSignal(0, _circuit.wit2sig[1 + _circuit.NOutputs + i], &v);
    }
}


typedef void (*ItFunc)(Circom_CalcWit *ctx, int idx, json val);

void iterateArr(Circom_CalcWit *ctx, int o, Circom_Sizes sizes, json jarr, ItFunc f) {
  if (!jarr.is_array()) {
    assert((sizes[0] == 1)&&(sizes[1] == 0));
    f(ctx, o, jarr);
  } else {
    int n = sizes[0] / sizes[1];
    for (int i=0; i<n; i++) {
      iterateArr(ctx, o + i*sizes[1], sizes+1, jarr[i], f);
    }
  }
}

void itFunc(Circom_CalcWit *ctx, int o, json val) {

    BigInt v;
    mpz_init2(v, 256);

    std::string s;

    if (val.is_string()) {
        s = val.get<std::string>();
    } else if (val.is_number()) {

        double vd = val.get<double>();
        std::stringstream stream;
        stream << std::fixed << std::setprecision(0) << vd;
        s = stream.str();
    } else {
        handle_error("Invalid JSON type");
    }

    mpz_set_str (v, s.c_str(), 10);

    ctx->setSignal(0, o, &v);
}


void loadJson(Circom_CalcWit *ctx, std::string filename) {
    std::ifstream inStream(filename);
    json j;
    inStream >> j;

    for (json::iterator it = j.begin(); it != j.end(); ++it) {
//      std::cout << it.key() << " => " << it.value() << '\n';
      u64 h = fnv1a(it.key());
      int o = ctx->getSignalOffset(0, h);
      Circom_Sizes sizes = ctx->getSignalSizes(0, h);
      iterateArr(ctx, o, sizes, it.value(), itFunc);
    }

}


void writeOutBin(Circom_CalcWit *ctx, std::string filename) {
    FILE *write_ptr;

    write_ptr = fopen(filename.c_str(),"wb");

    BigInt v;
    mpz_init2(v, 256);

    u8 buffOut[256];
    for (int i=0;i<_circuit.NVars;i++) {
        size_t  size=256;
        ctx->getWitness(i, &v);
        mpz_export(buffOut+1, &size,  -1, 1, -1, 0, v);
        *buffOut = (u8)size;
        fwrite(buffOut, size+1, 1, write_ptr);
    }
    fclose(write_ptr);

}


void writeOutJson(Circom_CalcWit *ctx, std::string filename) {

    std::ofstream outFile;
    outFile.open (filename);

    outFile << "[\n";

    BigInt v;
    mpz_init2(v, 256);

    char pcV[256];

    for (int i=0;i<_circuit.NVars;i++) {
        ctx->getWitness(i, &v);
        mpz_get_str(pcV, 10, v);
        std::string sV = std::string(pcV);
        outFile << (i ? "," : " ") << "\"" << sV << "\"\n";
    }

    outFile << "]\n";
    outFile.close();
}

bool hasEnding (std::string const &fullString, std::string const &ending) {
    if (fullString.length() >= ending.length()) {
        return (0 == fullString.compare (fullString.length() - ending.length(), ending.length(), ending));
    } else {
        return false;
    }
}

int main(int argc, char *argv[]) {
    if (argc!=3) {
        std::string cl = argv[0];
        std::string base_filename = cl.substr(cl.find_last_of("/\\") + 1);
        std::cout << "Usage: " << base_filename << " <input.<bin|json>> <output.<bin|json>>\n";
    } else {

        // open output
        Circom_CalcWit *ctx = new Circom_CalcWit(&_circuit);

        std::string infilename = argv[1];

        if (hasEnding(infilename, std::string(".bin"))) {
            loadBin(ctx, infilename);
        } else if (hasEnding(infilename, std::string(".json"))) {
            loadJson(ctx, infilename);
        } else {
            handle_error("Invalid input extension (.bin / .json)");
        }


        std::string outfilename = argv[2];

        if (hasEnding(outfilename, std::string(".bin"))) {
            writeOutBin(ctx, outfilename);
        } else if (hasEnding(outfilename, std::string(".json"))) {
            writeOutJson(ctx, outfilename);
        } else {
            handle_error("Invalid output extension (.bin / .json)");
        }

        delete ctx;
        exit(EXIT_SUCCESS);
    }
}
