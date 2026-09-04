import cv2
from process import clean_image
from skeleton import get_skeleton
from graph_utils import build_graph, compute_equation, visualize_graph

# 1. Load your leaf photo
image = cv2.imread('leaf3.jpg')

# 2. Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# 3. Adaptive threshold
thresholded = cv2.adaptiveThreshold(
    gray, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY,
    11,
    2
)

# 4. Save early stages
cv2.imwrite('leaf_gray.jpg', gray)
cv2.imwrite('leaf_thresholded.jpg', thresholded)

# 5. Clean the noise
cleaned = clean_image('leaf_thresholded.jpg')
cv2.imwrite('leaf_thresholded_cleaned.jpg', cleaned)

# 6. Skeletonize
skeleton = get_skeleton(cleaned)
cv2.imwrite('leaf_skeleton.jpg', (skeleton * 255).astype('uint8'))

# 7. Build the graph, visualize it, compute the equation
graph = build_graph(skeleton)
visualize_graph(graph)
R, N, E, C, mu, L = compute_equation(graph)

print(f"N={N}, E={E}, C={C}, mu={mu}, L={L}")
print(f"R = {R}")
print("Done — check the output .jpg files in this folder")