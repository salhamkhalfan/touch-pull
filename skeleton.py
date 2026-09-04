from skimage.morphology import skeletonize

def get_skeleton(cleaned_image):
    binary = cleaned_image > 0
    skeleton = skeletonize(binary)
    return skeleton