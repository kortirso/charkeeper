# frozen_string_literal: true

module CosmereCharacter
  class BaseBuilder
    def call(result:)
      result.merge({
        level: 1,
        ancestry: result[:ancestry],
        cultures: result[:cultures],
        expertises: { 'weapon' => [], 'armor' => [], 'culture' => result[:cultures] },
        path: result[:path],
        abilities: { 'str' => 0, 'spd' => 0, 'int' => 0, 'wil' => 0, 'awa' => 0, 'pre' => 0 },
        attribute_points: 12,
        skill_points: 4
      }).except(:skip_guide)
    end
  end
end
