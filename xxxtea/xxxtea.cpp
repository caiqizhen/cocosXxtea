// xxxtea.cpp : Defines the entry point for the console application.
//
#include <iostream>
#include <string>
#include "xxtea.h"
#include <fstream>
std::string getTxtContentFromFile(const std::string& fileName);
std::string getRawContentFromFile(const std::string& fileName);
void encryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key);
void decryptFile(const std::string& srcFileName, const std::string& outputFileName, const std::string& key);
int main(int argc, char* argv[])
{

	char* xxteaKey = "2f1d9d48-7551-42";
	std::cout << argc << std::endl;
	if (argc == 2) {
		std::string tempkey = argv[1];
		std::cout << tempkey << std::endl;
		xxteaKey = argv[1];
	}

	std::string fileName = "main.js";
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
	//encryptFile(fileName, "encrypt_main.js", key);


	//TEST2 测试解密
	decryptFile(fileName, "decrypt_main.js", key);
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

