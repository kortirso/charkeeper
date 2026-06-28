# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class BackgroundData
      include StoreModel::Model

      attribute :selected_feats, array: true, default: []
      attribute :selected_skills, array: true, default: {}
      attribute :ability_boosts, array: true, default: []
    end

    class Background < ::Homebrew
      attribute :data, Dnd2024::Homebrews::BackgroundData.to_type
    end
  end
end
