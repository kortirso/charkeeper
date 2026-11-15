# frozen_string_literal: true

ActiveAdmin.register Dnd2024::Feat do
  menu priority: 0, label: 'Dnd2024', parent: 'Feats'

  filter :slug, as: :string, label: 'Slug'
  filter :title_en_or_title_ru_i_cont, as: :string, label: 'Title'
  filter :origin, as: :select, label: 'Origin', collection: Dnd2024::Feat.origins
  filter :kind, as: :select, label: 'Kind', collection: Dnd2024::Feat.kinds
  filter :origin_value, as: :string, label: 'Origin value'

  permit_params :slug, :title, :origin, :kind, :origin_value

  json_editor

  index do |i|
    column :slug
    column :title, as: :jsonb
    column :origin
    column :kind
    column :origin_value
    i.actions
  end
end
