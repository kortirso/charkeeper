# frozen_string_literal: true

module Pathfinder2
  class ItemData
    include StoreModel::Model
  end
end

module Pathfinder2
  class Item < Item
    attribute :data, Pathfinder2::ItemData.to_type
  end
end
