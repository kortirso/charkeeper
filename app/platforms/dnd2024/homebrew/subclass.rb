# frozen_string_literal: true

module Dnd2024
  module Homebrew
    class SubclassData
      include StoreModel::Model
    end

    class Subclass < ::Homebrew::Subclass
      include Discard::Model

      attribute :data, Dnd2024::Homebrew::SubclassData.to_type
    end
  end
end
