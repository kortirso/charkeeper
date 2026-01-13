# frozen_string_literal: true

module DaggerheartCharacter
  class OverallDecorator < ApplicationDecorator
    def armor_score # rubocop: disable Metrics/AbcSize
      @armor_score ||=
        base_armor_score +
        item_bonuses.pluck('armor_score').compact.sum +
        sum(bonuses.pluck('armor_score')) +
        sum(dynamic_bonuses.pluck('armor_score')) +
        sum(static_feat_bonuses.pluck('armor_score')) +
        sum(dynamic_feat_bonuses.pluck('armor_score')) +
        sum(static_item_bonuses.pluck('armor_score')) +
        sum(dynamic_item_bonuses.pluck('armor_score'))
    end

    def armor_slots
      @armor_slots ||= armor_score
    end

    private

    def sum(values)
      values.sum(&:to_i)
    end
  end
end
