# frozen_string_literal: true

module Cthulhu7
  class ItemData
    include StoreModel::Model

    attribute :skill, :string
    attribute :damage, :string
    attribute :distance, :string
    attribute :attacks, :integer
  end
end

module Cthulhu7
  class Item < Item
    attribute :data, Cthulhu7::ItemData.to_type
  end
end
