import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export interface OSSystemProfile {
  valid: boolean;
  tools: {
    compilers: string[];
    hypervisors: string[];
    hardware: {
      cpu: string;
      memory: number;
      pciDevices: string[];
      usbDevices: string[];
    };
    kernelSources: string[];
    driverPackages: string[];
  };
}

export class SystemScanAgent {
  private profile: OSSystemProfile = {
    valid: false,
    tools: {
      compilers: [],
      hypervisors: [],
      hardware: {
        cpu: '',
        memory: 0,
        pciDevices: [],
        usbDevices: []
      },
      kernelSources: [],
      driverPackages: []
    }
  };

  async scanSystem(): Promise<OSSystemProfile> {
    console.log('Starting system scan...');
    
    // Phase 1: Toolchain & Hypervisor Detection
    this.detectCompilers();
    this.detectHypervisors();
    
    // Phase 2: Kernel & Driver Repository Scan
    this.scanKernelSources();
    this.scanDriverPackages();
    
    // Phase 3: Physical Hardware Scan
    await this.scanHardware();
    
    // Phase 4: Model + Learning Scan
    this.scanModels();
    
    // Validate system
    this.profile.valid = this.validateSystem();
    
    console.log('System scan complete');
    return this.profile;
  }

  private detectCompilers() {
    const compilers = ['gcc', 'clang', 'llvm'];
    for (const compiler of compilers) {
      try {
        const version = execSync(`${compiler} --version`, { encoding: 'utf8' });
        this.profile.tools.compilers.push(compiler);
        console.log(`Found ${compiler}: ${version.split('\n')[0]}`);
      } catch (error) {
        console.warn(`Compiler ${compiler} not found`);
      }
    }
  }

  private detectHypervisors() {
    const hypervisors = [
      { name: 'qemu', command: 'qemu-system-x86_64 --version' },
      { name: 'VirtualBox', command: 'VBoxManage --version' },
      { name: 'VMware', command: 'vmware -v' }
    ];

    for (const hypervisor of hypervisors) {
      try {
        const version = execSync(hypervisor.command, { encoding: 'utf8' });
        this.profile.tools.hypervisors.push(hypervisor.name);
        console.log(`Found ${hypervisor.name}: ${version.trim()}`);
      } catch (error) {
        console.warn(`Hypervisor ${hypervisor.name} not found`);
      }
    }
  }

  private scanKernelSources() {
    const kernelPaths = ['/usr/src/linux', '/usr/src/linux-headers-*'];
    for (const path of kernelPaths) {
      try {
        if (fs.existsSync(path)) {
          this.profile.tools.kernelSources.push(path);
          console.log(`Found kernel source: ${path}`);
        }
      } catch (error) {
        console.warn(`Kernel source path not found: ${path}`);
      }
    }
  }

  private scanDriverPackages() {
    const driverPaths = ['/lib/modules', '/usr/src/drivers'];
    for (const path of driverPaths) {
      try {
        if (fs.existsSync(path)) {
          this.profile.tools.driverPackages.push(path);
          console.log(`Found driver package: ${path}`);
        }
      } catch (error) {
        console.warn(`Driver package path not found: ${path}`);
      }
    }
  }

  private async scanHardware() {
    try {
      // CPU info
      const cpuInfo = execSync('lscpu', { encoding: 'utf8' });
      this.profile.tools.hardware.cpu = cpuInfo.split('\n')[0];
      
      // Memory info
      const memInfo = execSync('free -m', { encoding: 'utf8' });
      const memoryLine = memInfo.split('\n')[1];
      if (memoryLine) {
        const memory = parseInt(memoryLine.split('\s+')[1]);
        this.profile.tools.hardware.memory = memory;
      }
      
      // PCI devices
      const pciDevices = execSync('lspci', { encoding: 'utf8' });
      this.profile.tools.hardware.pciDevices = pciDevices.trim().split('\n');
      
      // USB devices
      const usbDevices = execSync('lsusb', { encoding: 'utf8' });
      this.profile.tools.hardware.usbDevices = usbDevices.trim().split('\n');
      
      console.log('Hardware scan complete');
    } catch (error) {
      console.error('Hardware scan failed:', error);
    }
  }

  private scanModels() {
    // Placeholder for model scanning logic
    console.log('Scanning models...');
  }

  private validateSystem(): boolean {
    // Check if we have at least one compiler and hypervisor
    return this.profile.tools.compilers.length > 0 && 
           this.profile.tools.hypervisors.length > 0;
  }

  getProfile(): OSSystemProfile {
    return this.profile;
  }

  getTools(): any {
    return this.profile.tools;
  }
}