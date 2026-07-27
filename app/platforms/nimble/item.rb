# frozen_string_literal: true

module Nimble
  class ItemData
    include StoreModel::Model

    attribute :price, :integer
  end
end

module Nimble
  class Item < Item
    attribute :data, Nimble::ItemData.to_type
  end
end
