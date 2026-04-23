from setuptools import setup, find_packages

setup(
    name="jeopardy-bio",
    version="0.1.0",
    description="Un proyecto de Python",
    author="Tu Nombre",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        # Dependencias
    ],
)
