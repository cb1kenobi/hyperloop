/**
 * memops benchmark in C
 *
 * gcc memops.c -o memops
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

int main(int argc, char **argv) {
  int N = 1024*1024, 
      M = 800;
  float startTime = (float)clock()/(CLOCKS_PER_SEC/1000);
  int final = 0;
  char *buf = (char*)malloc(N);
  for (int t = 0; t < M; t++) {
    for (int i = 0; i < N; i++)
      buf[i] = (i + final)%256;
    for (int i = 0; i < N; i++)
      final += buf[i] & 1;
    final = final % 1000;
  }
  float endTime = (float)clock()/(CLOCKS_PER_SEC/1000);

  printf("duration: %f ms\n", (endTime-startTime));
  return 0;
}
