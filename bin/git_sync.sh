for file in `ls ../`; do
  echo "PULLING $file"
  cd ../$file;
  git pull;
done;
