# frozen_string_literal: true

module Cosmere
  module Homebrew
    class SubclassData
      include StoreModel::Model

      attribute :names, array: true, default: {}
      attribute :descriptions, array: true, default: {}
    end

    class Subclass < ::Homebrew::Subclass
      attribute :data, Cosmere::Homebrew::SubclassData.to_type
    end
  end
end
