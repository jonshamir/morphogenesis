import open3d as o3d
import numpy as np
import os
from scipy.spatial.transform import Rotation


def process_sprout_points(input_path, output_path, file_name):
    point_cloud = o3d.io.read_point_cloud(input_path + file_name)

    # Center points
    point_cloud.translate([-0.055, 0, 11.22])

    # Rotate parallel to axes
    rotation_matrix = Rotation.from_euler(
        'xyz', [-0.22, -0.33, 0.03]).as_matrix()
    point_cloud.rotate(rotation_matrix)

    # Filter points outside area of interest
    points = np.asarray(point_cloud.points)
    colors = np.asarray(point_cloud.colors)

    max_distance = 0.9
    d = 0.75
    x_range = [-d, d]
    z_range = [-d, d]

    x_values = points[:, 0]
    y_values = points[:, 1]
    z_values = points[:, 2]
    distances = np.linalg.norm(np.asarray(point_cloud.points), axis=1)

    mask = (distances <= max_distance) & \
        (x_values >= x_range[0]) & (x_values <= x_range[1]) & \
        (z_values >= z_range[0]) & (z_values <= z_range[1])

    filtered_points = points[mask]
    filtered_colors = colors[mask]

    filtered_point_cloud = o3d.geometry.PointCloud()
    filtered_point_cloud.points = o3d.utility.Vector3dVector(filtered_points)
    filtered_point_cloud.colors = o3d.utility.Vector3dVector(filtered_colors)

    o3d.io.write_point_cloud(output_path + file_name, filtered_point_cloud)


def process_flower_points(input_path, output_path, file_name):
    point_cloud = o3d.io.read_point_cloud(input_path + file_name)

    # Center points
    point_cloud.translate([42, 20, 7])
    point_cloud.scale(0.2, [0, 0, 0])

    # Rotate parallel to axes
    rotation_matrix = Rotation.from_euler(
        'xyz', [-0.22, -0.33, 0.03]).as_matrix()
    point_cloud.rotate(rotation_matrix)

    # Filter points outside area of interest
    points = np.asarray(point_cloud.points)
    colors = np.asarray(point_cloud.colors)

    max_distance = 4
    d = 0.85
    x_range = [-d, d]
    y_range = [0, 10]
    z_range = [-d, d]

    x_values = points[:, 0]
    y_values = points[:, 1]
    z_values = points[:, 2]
    distances = np.linalg.norm(np.asarray(point_cloud.points), axis=1)

    mask = (x_values >= x_range[0]) & (x_values <= x_range[1]) & \
        (y_values >= y_range[0]) & (y_values <= y_range[1]) & \
        (z_values >= z_range[0]) & (z_values <= z_range[1])

    filtered_points = points[mask]
    filtered_colors = colors[mask]

    filtered_point_cloud = o3d.geometry.PointCloud()
    filtered_point_cloud.points = o3d.utility.Vector3dVector(filtered_points)
    filtered_point_cloud.colors = o3d.utility.Vector3dVector(filtered_colors)

    o3d.io.write_point_cloud(output_path + file_name, filtered_point_cloud)


input_path = "data/data_raw/flower/"
output_path = "public/data/flower/"

for root, dirs, files in os.walk(input_path):
    for name in files:
        process_flower_points(input_path, output_path, name)
