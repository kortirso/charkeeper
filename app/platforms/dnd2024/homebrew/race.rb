# frozen_string_literal: true

module Dnd2024
  module Homebrew
    class RaceData
      include StoreModel::Model

      attribute :speed, :integer, default: 30
      attribute :resistance, array: true, default: []
      attribute :size, array: true, default: ['medium']
    end

    class Race < ::Homebrew::Race
      attribute :data, Dnd2024::Homebrew::RaceData.to_type
    end
  end
end
