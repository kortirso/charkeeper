# frozen_string_literal: true

module Cosmere
  class ItemData
    include StoreModel::Model

    attribute :weight, :float
    attribute :price, :integer
  end
end

module Cosmere
  class Item < Item
    attribute :data, Cosmere::ItemData.to_type
  end
end
