process.env.HYPERLOOP_TEST = 1;
if (!process.env.TMPDIR) {
	process.env.TMPDIR = process.env.TEMP || '/tmp';
}