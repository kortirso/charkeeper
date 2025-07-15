# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class RaceData
      include StoreModel::Model
    end

    class Race < ::Homebrew::Race
      attribute :data, Daggerheart::Homebrew::RaceData.to_type
    end
  end
end
