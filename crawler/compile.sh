rm -rf build
mkdir build
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=/home/brandon/osuFM/crawler/vcpkg/scripts/buildsystems/vcpkg.cmake
cmake build .
make