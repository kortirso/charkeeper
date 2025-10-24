# frozen_string_literal: true

module Dc20
  class ItemData
    include StoreModel::Model
  end
end

module Dc20
  class Item < Item
    attribute :data, Dc20::ItemData.to_type
  end
end
