# install packages
This project uses go workspaces. The repositories, this project relies on, must be cloned into the local directory and will be listed in the go.work file.

# clean go cache of old modules from go get
<code>go clean -cache -modcache</code>
