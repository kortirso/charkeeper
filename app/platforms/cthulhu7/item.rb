# frozen_string_literal: true

module Cthulhu7
  class ItemData
    include StoreModel::Model
  end
end

module Cthulhu7
  class Item < Item
    attribute :data, Cthulhu7::ItemData.to_type
  end
end
