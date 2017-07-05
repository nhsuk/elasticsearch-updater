const chai = require('chai');

const fileHelper = require('../../lib/utils/fileHelper');

const expect = chai.expect;

describe('File helper', () => {
  it('filenameFromUrl should return filename as last part of URL', () => {
    const filename = fileHelper.filenameFromUrl('some/site/file.json');
    expect(filename).to.equal('file.json');
  });
  it('loadJson for missing file should return empty array', () => {
    const results = fileHelper.loadJson('./no/such/file.json');
    expect(results.length).to.equal(0);
  });
});
