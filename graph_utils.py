import networkx as nx
import sknw
import matplotlib.pyplot as plt
import numpy as np

def build_graph(skeleton):
    return sknw.build_sknw(skeleton.astype('uint16'))

def compute_equation(graph):
    N = graph.number_of_nodes()
    E = graph.number_of_edges()
    C = nx.number_connected_components(graph)
    mu = max(E - N + C, 1)

    L = 0
    for _, _, data in graph.edges(data=True):
        pts = data['pts'].astype(np.float64)
        for i in range(1, len(pts)):
            L += ((pts[i][0]-pts[i-1][0])**2 + (pts[i][1]-pts[i-1][1])**2) ** 0.5

    R = (N + E) * mu + int(L)
    return R, N, E, C, mu, int(L)
def visualize_graph(graph, output_path='leaf_graph.jpg'):
    plt.figure(figsize=(10, 8))
    for (s, e) in graph.edges():
        ps = graph[s][e]['pts']
        plt.plot(ps[:, 1], ps[:, 0], 'green', linewidth=1)

    nodes = graph.nodes()
    node_coords = np.array([nodes[i]['o'] for i in nodes])
    plt.plot(node_coords[:, 1], node_coords[:, 0], 'r.', markersize=8)

    plt.gca().invert_yaxis()
    plt.title('Leaf Vein Graph')
    plt.axis('off')
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()