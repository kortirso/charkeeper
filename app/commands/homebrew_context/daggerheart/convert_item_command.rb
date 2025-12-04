# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ConvertItemCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_item

        Kinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon', 'armor')

        params do
          required(:item).filled(type?: ::Daggerheart::Item)
          required(:kind).filled(Kinds)
        end
      end

      private

      def do_prepare(input)
        input[:info] =
          case input[:kind]
          when 'primary weapon', 'secondary weapon' then weapon_info
          when 'armor' then armor_info
          end
      end

      def do_persist(input)
        input[:item].update!(input.except(:item))

        { result: input[:item] }
      end

      def weapon_info
        {
          tier: 1,
          trait: 'agi',
          range: 'melee',
          damage: 'd8',
          damage_bonus: 0,
          damage_type: 'physical',
          burden: 1,
          bonuses: {},
          features: []
        }
      end

      def armor_info
        {
          tier: 1,
          base_score: 3,
          bonuses: {
            thresholds: {
              major: 5,
              severe: 10
            }
          },
          features: []
        }
      end
    end
  end
end
