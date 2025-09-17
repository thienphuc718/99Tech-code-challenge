// Implementation 1: n*(n+1)/2
function sum_to_n_a(n) {
  return (n * (n + 1)) / 2;
}

// Implementation 2: For loop
function sum_to_n_b(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Implementation 3: Recursive
function sum_to_n_c(n) {
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
}

// Test cases
console.log('Testing sum_to_n_a:');
console.log(`sum_to_n_a(5) = ${sum_to_n_a(5)}`); // 15
console.log(`sum_to_n_a(10) = ${sum_to_n_a(10)}`); // 55

console.log('\nTesting sum_to_n_b:');
console.log(`sum_to_n_b(5) = ${sum_to_n_b(5)}`); // 15
console.log(`sum_to_n_b(10) = ${sum_to_n_b(10)}`); // 55

console.log('\nTesting sum_to_n_c:');
console.log(`sum_to_n_c(5) = ${sum_to_n_c(5)}`); // 15
console.log(`sum_to_n_c(10) = ${sum_to_n_c(10)}`); // 55
