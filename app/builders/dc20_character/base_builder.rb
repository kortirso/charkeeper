# frozen_string_literal: true

module Dc20Character
  class BaseBuilder
    def call(result:)
      result.merge({
        classes: { result[:main_class] => 1 },
        ancestries: result[:ancestry_feats].keys,
        attribute_points: calculate_attribute_points(result[:ancestry_feats]),
        skill_expertise_points: calculate_skill_expertise_points(result[:ancestry_feats]),
        trade_expertise_points: calculate_trade_expertise_points(result[:ancestry_feats])
      }).except(:ancestry_feats)
    end

    private

    def calculate_attribute_points(ancestry_feats)
      total = 12
      total += 1 if ancestry_feats['human']&.include?('attribute_increase')
      total -= 1 if ancestry_feats['human']&.include?('attribute_decrease')
      total
    end

    def calculate_skill_expertise_points(ancestry_feats)
      total = 0
      total += 1 if ancestry_feats['human']&.include?('skill_expertise')
      total
    end

    def calculate_trade_expertise_points(ancestry_feats)
      total = 0
      total += 1 if ancestry_feats['human']&.include?('trade_expertise')
      total
    end
  end
end
