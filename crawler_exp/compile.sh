rm -rf build
mkdir build
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=/home/brandon/osuFM/crawler_exp/vcpkg/scripts/buildsystems/vcpkg.cmake
cmake build .
make
#swig -python oppai.i
#gcc -fPIC -c oppai.c oppai_wrap.c -I/usr/include/python3.7m
#ld -shared oppai.o oppai_wrap.o -o _oppai.so