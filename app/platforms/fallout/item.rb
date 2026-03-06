# frozen_string_literal: true

module Fallout
  class ItemData
    include StoreModel::Model

    attribute :weight, :integer
    attribute :price, :integer
    attribute :rarity, :integer
  end
end

module Fallout
  class Item < Item
    attribute :data, Fallout::ItemData.to_type
  end
end
