import math
def ci(pos, n):
    z = 1.96
    phat = 1.0 * pos / n

    return (phat + z*z/(2*n) - z * math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)


print(ci(4500,5000))