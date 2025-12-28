# frozen_string_literal: true

module Dc20Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: {},
        ancestries: result[:ancestry_feats].keys,
        attribute_points: 12,
        skill_expertise_points: 0,
        trade_expertise_points: 0,
        guide_step: 1,
        maneuvers: []
      }).except(:ancestry_feats)
    end
  end
end
