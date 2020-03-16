#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <iomanip>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <fcntl.h>
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

    FrElement v;
    u8 *p = in;
    for (int i=0; i<_circuit.NInputs; i++) {
        v.type = Fr_LONG;
        for (int j=0; j<Fr_N64; j++) {
            v.longVal[j] = *(u64 *)p;
        }
        p += 8;
        ctx->setSignal(0, 0, _circuit.wit2sig[1 + _circuit.NOutputs + i], &v);
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

    FrElement v;

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

    Fr_str2element (&v, s.c_str());

    ctx->setSignal(0, 0, o, &v);
}


void loadJson(Circom_CalcWit *ctx, std::string filename) {
    std::ifstream inStream(filename);
    json j;
    inStream >> j;

    for (json::iterator it = j.begin(); it != j.end(); ++it) {
//      std::cout << it.key() << " => " << it.value() << '\n';
      u64 h = fnv1a(it.key());
      int o;
      try {
        o = ctx->getSignalOffset(0, h);
      } catch (std::runtime_error e) {
        std::ostringstream errStrStream;
        errStrStream << "Error loadin variable: " << it.key() << "\n" << e.what();
        throw std::runtime_error(errStrStream.str() );
      }
      Circom_Sizes sizes = ctx->getSignalSizes(0, h);
      iterateArr(ctx, o, sizes, it.value(), itFunc);
    }

}


void writeOutBin(Circom_CalcWit *ctx, std::string filename) {
    FILE *write_ptr;

    write_ptr = fopen(filename.c_str(),"wb");

    FrElement v;

    u8 buffOut[256];
    for (int i=0;i<_circuit.NVars;i++) {
        size_t  size=256;
        ctx->getWitness(i, &v);
        Fr_toLongNormal(&v);
        fwrite(v.longVal, Fr_N64*8, 1, write_ptr);
    }
    fclose(write_ptr);

}


void writeOutJson(Circom_CalcWit *ctx, std::string filename) {

    std::ofstream outFile;
    outFile.open (filename);

    outFile << "[\n";

    FrElement v;

    for (int i=0;i<_circuit.NVars;i++) {
        ctx->getWitness(i, &v);
        char *pcV = Fr_element2str(&v);
        std::string sV = std::string(pcV);
        outFile << (i ? "," : " ") << "\"" << sV << "\"\n";
        free(pcV);
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
    Fr_init();
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

        ctx->join();

        // printf("Finished!\n");

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
