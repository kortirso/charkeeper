# frozen_string_literal: true

module Dc20Character
  module Classes
    class WizardUpdater
      LEVELING = {
        2 => { 'class_feature_points' => 1, 'talent_points' => 1, 'path_points' => 1 },
        3 => { 'attribute_points' => 1, 'skill_points' => 1, 'trade_points' => 1, 'subclass_feature_points' => 1 }
      }.freeze

      def call(character:)
        character.data =
          character.data.attributes.merge(LEVELING[character.data.level]) { |_key, oldval, newval| newval + oldval }
        character.save
      end
    end
  end
end
