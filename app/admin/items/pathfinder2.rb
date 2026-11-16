# frozen_string_literal: true

ActiveAdmin.register Pathfinder2::Item do
  menu priority: 0, label: 'Pathfinder2', parent: 'Items'

  filter :slug, as: :string, label: 'Slug'
  filter :name_en_or_name_ru_i_cont, as: :string, label: 'Title'
  filter :kind, as: :string, label: 'Kind'

  permit_params :slug, :name, :kind

  json_editor

  index do |i|
    column :slug
    column :name, as: :jsonb
    column :kind
    i.actions
  end
end
