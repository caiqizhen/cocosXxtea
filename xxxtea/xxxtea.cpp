// xxxtea.cpp : Defines the entry point for the console application.
//
#include <iostream>
#include <string>
#include "xxtea.h"
#include <fstream>
#include <Shlobj.h>
#include <cstdlib>
#include <sstream>
#include <zlib.h>

#define BUFFER_INC_FACTOR (2)

std::string getTxtContentFromFile(const std::string& fileName);
std::string getRawContentFromFile(const std::string& fileName);
void encryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key);
void decryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key);
void decryptFileNew(const std::string& srcFileName, const std::string& outputFileName, const std::string& key);

bool isGZipBuffer(const unsigned char *buffer, long len)
{
	if (len < 2)
	{
		return false;
	}

	return buffer[0] == 0x1F && buffer[1] == 0x8B;
}

int main(int argc, char* argv[])
{

	char* xxteaKey = "336f0996-0644-41";
	std::cout << argc << std::endl;
	if (argc == 2) {
		std::string tempkey = argv[1];
		std::cout << tempkey << std::endl;
		xxteaKey = argv[1];
	}

	std::string fileName = "settings.jsc";
	if (argc == 3) {
		xxteaKey = argv[1];
		fileName = argv[2];
	}

	std::string key = xxteaKey;

	std::cout << key << std::endl;
	if (key == "") {
		std::cout << "key is error" << std::endl;
		return 1;
	}
	if (fileName == "") {
		std::cout << "file name is error" << std::endl;
		return 1;
	}
	std::cout << fileName << std::endl;
	//2f1d9d48-7551-42
	//std::string key = "2f1d9d48-7555-cc";
	unsigned char data[] = { 0x11, 0x12, 0x13, 0x14 };
	//TEST1  测试加密
	//encryptFile("main.js", "encrypt_main.jsc", key);


	//TEST2 测试解密
	//decryptFileNew(fileName, "decrypt_main.js", key);
	decryptFileNew("cocos2d-jsb.jsc", "decrypt_main.js", "336f0996-0644-41");
	return 1;
}

//加密文件
void encryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key)
{
	//std::string key = "2f1d9d48-7551-42";
	//std::fstream fs(srcFileName, std::fstream::in);
	//int lineCount = 0;
	//std::string fileContent;
	//while (fs.eof() == false)
	//{
	//	char line[256];
	//	fs.getline(line, sizeof(line));
	//	std::string context(line);
	//	if (!context.empty())
	//	{
	//		context.push_back('\n');
	//		fileContent += context;
	//	}
	//}
	//std::cout << fileContent;
	std::string fileContent = getRawContentFromFile(srcFileName);
	std::ofstream output(outputFileName, std::ios::binary);
	xxtea_long len = 0;
	unsigned char* p = xxtea_encrypt((unsigned char*)(&fileContent[0]), fileContent.size(), (unsigned char*)key.c_str(), key.size(), &len);
	output.write((const char*)p, len);
	output.close();
}

/*
解密文件
*/
void decryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key)
{
	std::string rawContent = getRawContentFromFile(srcFileName);
	xxtea_long len2 = 0;
	unsigned char* p2 = xxtea_decrypt((unsigned char*)(&rawContent[0]), rawContent.length(), (unsigned char*)key.c_str(), key.size(), &len2);
	std::ofstream out(outputFileName, std::ios::binary);
	out.write((const char*)p2, len2);
	out.close();
}
/*
读取文本文件的
*/
std::string getTxtContentFromFile(const std::string& fileName)
{
	std::fstream fs(fileName, std::fstream::in);
	int lineCount = 0;
	std::string fileContent;
	while (fs.eof() == false)
	{
		char line[256];
		fs.getline(line, sizeof(line));
		std::string context(line);
		if (!context.empty())
		{
			context.push_back('\n');
			fileContent += context;
		}
	}
	return fileContent;
}


/*
读取二进制文件的
*/
std::string getRawContentFromFile(const std::string& fileName)
{
	std::ifstream fs(fileName, std::ios::binary);
	int lineCount = 0;
	std::string fileContent;
	while (fs.eof() == false)
	{
		char line[256];
		fs.read(line, sizeof(line));
		std::cout << "读取到:" << fs.gcount() << " 字节!" << std::endl;
		if (fs.gcount() != 0)
		{
			fileContent.insert(fileContent.end(), line, line + fs.gcount());
		}
	}
	return fileContent;
}

std::wstring StringUtf8ToWideChar(const std::string &strUtf8) {
	std::wstring ret;
	if (!strUtf8.empty()) {
		int nNum = MultiByteToWideChar(CP_UTF8, 0, strUtf8.c_str(), -1, nullptr, 0);
		if (nNum) {
			WCHAR *wideCharString = new WCHAR[nNum + 1];
			wideCharString[0] = 0;

			nNum = MultiByteToWideChar(CP_UTF8, 0, strUtf8.c_str(), -1, wideCharString, nNum + 1);

			ret = wideCharString;
			delete[] wideCharString;
		}
		else {
			std::cout << "Wrong convert to WideChar code:0x%x" << GetLastError() << std::endl;
		}
	}
	return ret;
}

int inflateMemoryWithHintReal(unsigned char *in, long inLength, unsigned char **out, long *outLength, long outLengthHint)
{
	int err = Z_OK;

	long bufferSize = outLengthHint;
	*out = (unsigned char*)malloc(bufferSize);

	z_stream d_stream;
	d_stream.zalloc = (alloc_func)0;
	d_stream.zfree = (free_func)0;
	d_stream.opaque = (voidpf)0;

	d_stream.next_in = in;
	d_stream.avail_in = static_cast<unsigned int>(inLength);
	d_stream.next_out = *out;
	d_stream.avail_out = static_cast<unsigned int>(bufferSize);

	if ((err = inflateInit2(&d_stream, 15 + 32)) != Z_OK)
		return err;

	for (;;)
	{
		err = inflate(&d_stream, Z_NO_FLUSH);

		if (err == Z_STREAM_END)
		{
			break;
		}

		switch (err)
		{
		case Z_NEED_DICT:
			err = Z_DATA_ERROR;
		case Z_DATA_ERROR:
		case Z_MEM_ERROR:
			inflateEnd(&d_stream);
			return err;
		}

		// not enough memory ?
		if (err != Z_STREAM_END)
		{
			*out = (unsigned char*)realloc(*out, bufferSize * BUFFER_INC_FACTOR);

			if (!*out)
			{
				std::cout << "ZipUtils: realloc failed" << std::endl;
				inflateEnd(&d_stream);
				return Z_MEM_ERROR;
			}

			d_stream.next_out = *out + bufferSize;
			d_stream.avail_out = static_cast<unsigned int>(bufferSize);
			bufferSize *= BUFFER_INC_FACTOR;
		}
	}

	*outLength = bufferSize - d_stream.avail_out;
	err = inflateEnd(&d_stream);
	return err;
}

long inflateMemoryWithHint(unsigned char *in, long inLength, unsigned char **out, long outLengthHint)
{
	long outLength = 0;
	int err = inflateMemoryWithHintReal(in, inLength, out, &outLength, outLengthHint);

	if (err != Z_OK || *out == nullptr) {
		if (err == Z_MEM_ERROR)
		{
			std::cout << "ZipUtils: Out of memory while decompressing map data!" << std::endl;
		}
		else
			if (err == Z_VERSION_ERROR)
			{
				std::cout << "ZipUtils: Incompatible zlib version!" << std::endl;
			}
			else
				if (err == Z_DATA_ERROR)
				{
					std::cout << "ZipUtils: Incorrect zlib compressed data!" << std::endl;
				}
				else
				{
					std::cout << "ZipUtils: Unknown error while decompressing map data!" << std::endl;
				}

		if (*out) {
			free(*out);
			*out = nullptr;
		}
		outLength = 0;
	}

	return outLength;
}


void decryptFileNew(const std::string& srcFileName, const std::string& outputFileName, const std::string& key) {
	HANDLE fileHandle = ::CreateFile(StringUtf8ToWideChar(srcFileName).c_str(), GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, NULL, nullptr);

	if (fileHandle == INVALID_HANDLE_VALUE)
		return;

	DWORD hi;
	auto size = ::GetFileSize(fileHandle, &hi);
	if (hi > 0) {
		::CloseHandle(fileHandle);
		return;
	}
	// don't read file content if it is empty
	if (size == 0) {
		::CloseHandle(fileHandle);
		return;
	}

	unsigned char* buffer = new unsigned char[size];
	DWORD sizeRead = 0;
	BOOL successed = ::ReadFile(fileHandle, buffer, size, &sizeRead, nullptr);
	::CloseHandle(fileHandle);

	if (!successed) {
		std::cout << srcFileName.c_str() << std::to_string(::GetLastError()).data() << std::endl;
		delete buffer;
		return;
	}
	xxtea_long len2 = 0;
	unsigned char* p2 = xxtea_decrypt(buffer, size, (unsigned char*)key.c_str(), key.size(), &len2);
	
	boolean isGZip = isGZipBuffer(p2, len2);
	
	if (isGZip) {
		uint8_t* unpackedData;
		long unpackedLen = inflateMemoryWithHint(p2, len2, &unpackedData, 256*1024);

		if (unpackedData == nullptr) {
			std::cout << "Can't decrypt code for " << std::endl;
			return;
		}

		std::ofstream out(outputFileName, std::ios::binary);
		out.write((const char*)unpackedData, len2);
		out.close();

		free(p2);
		free(unpackedData);
	}
	else {
		free(p2);
	}
	
	delete buffer;
}



