# frozen_string_literal: true

module Dnd5
  class ItemData
    include StoreModel::Model

    attribute :weight, :float
    attribute :price, :integer
  end
end

module Dnd5
  class Item < Item
    attribute :data, Dnd5::ItemData.to_type
  end
end
