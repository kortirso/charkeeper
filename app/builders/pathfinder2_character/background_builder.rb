# frozen_string_literal: true

module Pathfinder2Character
  class BackgroundBuilder
    def call(result:)
      background_builder(result)
    end

    private

    def background_builder(result) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
      config = Config.data('pathfinder2', 'backgrounds')[result[:background]]
      if config
        result[:ability_boosts].merge!({ :free => 1, config['ability_boosts'].to_sym => 1 }) { |_, oldval, newval|
          oldval + newval
        }
        result[:skill_boosts].merge!({ config['skill_boosts'].to_sym => 1 }) { |_, oldval, newval| oldval + newval }

        lore_id = SecureRandom.alphanumeric(10)
        result[:lores] = { lore_id => config['lore_name'] }
        result[:selected_skills] = { lore_id => 1 }

        result[:ability_boosts_v2][:background] = { config['ability_boosts'] => 1, 'free' => 1 }

        return result
      end

      config = ::Pathfinder2::Homebrews::Background.find_by(id: result[:background])&.info&.attributes
      if config
        result[:ability_boosts_v2][:background] = {}
        if config['ability_free_boosts']
          result[:ability_boosts_v2][:background] = { 'free' => config['ability_free_boosts'].to_i }
        end
        result[:ability_boosts_v2][:background][config['ability_boosts'].join('_')] = 1 unless config['ability_boosts'].empty?

        config['lore_names']&.each do |lore_name|
          lore_id = SecureRandom.alphanumeric(10)
          result[:lores][lore_id] = lore_name
          result[:selected_skills][lore_id] = 1
        end

        result[:skill_boosts].merge!(config['skill_boosts'].tally.transform_keys(&:to_sym)) { |_, oldval, newval|
          oldval + newval
        }
      end

      result
    end
  end
end
