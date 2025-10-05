# frozen_string_literal: true

module Pathfinder2Character
  class BackgroundBuilder
    def call(result:)
      background_builder(result)
    end

    private

    def background_builder(result)
      config = Config.data('pathfinder2', 'backgrounds')[result[:background]]

      result[:ability_boosts].merge!({ :free => 1, config['ability_boosts'].to_sym => 1 }) { |_, oldval, newval| oldval + newval }
      result[:skill_boosts].merge!({ config['skill_boosts'].to_sym => 1 }) { |_, oldval, newval| oldval + newval }
      result[:lore_skills][:lore1] = { name: config['lore_name'], level: 1 }

      result
    end
  end
end
