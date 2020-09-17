cmake_minimum_required(VERSION 3.0)
project(test)

set(CMAKE_BUILD_TYPE Debug)
add_compile_options(-Wall -Wextra -pedantic)

find_package(cpr CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(unofficial-sqlite3 CONFIG REQUIRED)

add_library(oppai oppai.c)
SET_TARGET_PROPERTIES(oppai PROPERTIES COMPILE_FLAGS "-DOPPAI_EXPORT")

add_executable(main main.cpp)

target_link_libraries(main PRIVATE oppai cpr nlohmann_json nlohmann_json::nlohmann_json unofficial::sqlite3::sqlite3)