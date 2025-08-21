const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

const childProcess = require('child_process');
const { runCommand, runFormatForProject } = require('../scripts/format-all');

describe('runCommand', () => {
  test('returns success when command executes', () => {
    childProcess.execSync.mockReturnValue('output');
    const result = runCommand('echo test', '.');
    expect(result).toEqual({ success: true, output: 'output' });
  });

  test('returns failure when command throws', () => {
    childProcess.execSync.mockImplementation(() => {
      throw new Error('boom');
    });
    const result = runCommand('bad', '.');
    expect(result.success).toBe(false);
    expect(result.error).toContain('boom');
  });
});

describe('runFormatForProject', () => {
  let logSpy;
  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterAll(() => {
    logSpy.mockRestore();
  });

  test('returns false when project directory is missing', () => {
    const project = { name: 'Missing', path: path.join(os.tmpdir(), 'does-not-exist') };
    const result = runFormatForProject(project);
    expect(result).toBe(false);
  });

  test('returns false when package.json is missing', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-'));
    const project = { name: 'NoPkg', path: tmpDir };
    const result = runFormatForProject(project);
    expect(result).toBe(false);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns true when formatting succeeds', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    childProcess.execSync.mockReturnValue('ok');
    const project = { name: 'OK', path: tmpDir };
    const result = runFormatForProject(project);
    expect(result).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns false when formatting command fails', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    childProcess.execSync.mockImplementation(() => {
      throw new Error('fail');
    });
    const project = { name: 'Fail', path: tmpDir };
    const result = runFormatForProject(project);
    expect(result).toBe(false);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
