# frozen_string_literal: true

module Dnd2024
  module Homebrew
    class BackgroundData
      include StoreModel::Model

      attribute :selected_feats, array: true, default: []
      attribute :selected_skills, array: true, default: {}
      attribute :ability_boosts, array: true, default: []
    end

    class Background < ::Homebrew::Community
      attribute :data, Dnd2024::Homebrew::BackgroundData.to_type
    end
  end
end
