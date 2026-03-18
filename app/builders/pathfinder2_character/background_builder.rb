# frozen_string_literal: true

module Pathfinder2Character
  class BackgroundBuilder
    def call(result:)
      background_builder(result)
    end

    private

    def background_builder(result) # rubocop: disable Metrics/AbcSize
      config = Config.data('pathfinder2', 'backgrounds')[result[:background]]

      result[:ability_boosts].merge!({ :free => 1, config['ability_boosts'].to_sym => 1 }) { |_, oldval, newval| oldval + newval }
      result[:skill_boosts].merge!({ config['skill_boosts'].to_sym => 1 }) { |_, oldval, newval| oldval + newval }

      lore_id = SecureRandom.alphanumeric(10)
      result[:lores] = { lore_id => config['lore_name'] }
      result[:selected_skills] = { lore_id => 1 }

      result[:ability_boosts_v2][:background] = { config['ability_boosts'] => 1, 'free' => 1 }

      result
    end
  end
end
