# frozen_string_literal: true

module Dc20
  class WildFormData
    include StoreModel::Model

    attribute :ancestry_features, array: true, default: {} # { 'fighting_style' => 2 }
    attribute :health, array: true, default: { 'current' => 3, 'temp' => 0, 'max' => 3 }
  end

  class WildForm < Character
    attribute :data, Dc20::WildFormData.to_type
  end
end
