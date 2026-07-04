# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Feats
        class AddCommand < BaseCommand
          include Deps[
            refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
          ]

          # rubocop: disable Metrics/BlockLength
          use_contract do
            Origins =
              Dry::Types['strict.string'].enum(
                'ancestry', 'class', 'subclass', 'community', 'character', 'transformation', 'domain_card'
              )
            Kinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon')
            Traits = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')
            Ranges = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far', 'very far')
            DamageTypes = Dry::Types['strict.string'].enum('physical', 'magic')
            Damages = Dry::Types['strict.string'].enum('d4', 'd6', 'd8', 'd10', 'd12', 'd20')
            Types = Dry::Types['strict.string'].enum('spell', 'ability', 'grimoire')

            params do
              required(:user).filled(type?: ::User)
              required(:title).hash
              required(:description).hash
              required(:origin).filled(Origins)
              required(:origin_value).filled(:string)
              required(:kind).filled(:string)
              optional(:limit).filled(:integer)
              optional(:limit_refresh).filled(:string)
              optional(:modifiers).hash
              optional(:subclass_mastery).filled(:integer)
              optional(:level).filled(:integer)
              optional(:no_refresh).filled(:bool)
              optional(:continious).filled(:bool)
              optional(:type).filled(Types)
              optional(:recall).filled(:integer, gteq?: 1, lteq?: 10)
              optional(:tokens).hash do
                optional(:limit).filled(:string)
                optional(:reset_at).filled(:string)
                optional(:reset).filled(:string)
              end
              optional(:price).hash do
                optional(:stress).filled(:integer, gteq?: 1, lteq?: 10)
                optional(:hope).filled(:integer, gteq?: 1, lteq?: 10)
              end
              optional(:attacks).maybe(:array).each(:hash) do
                required(:kind).filled(Kinds)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                required(:info).hash do
                  required(:burden).filled(:integer, gteq?: 1, lteq?: 2)
                  required(:tier).filled(:integer, gteq?: 1, lteq?: 4)
                  required(:trait).filled(Traits)
                  required(:range).filled(Ranges)
                  required(:damage_type).filled(DamageTypes)
                  required(:damage).filled(Damages)
                  required(:damage_bonus).filled(:integer, gteq?: 0, lteq?: 20)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 250)
                    optional(:ru).maybe(:string, max_size?: 250)
                    optional(:es).maybe(:string, max_size?: 250)
                  end
                end
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            input[:slug] = SecureRandom.uuid
            if input[:origin] == 'subclass' && input.key?(:subclass_mastery)
              input[:conditions] = { subclass_mastery: input[:subclass_mastery] }
            end
            if input[:origin] == 'domain_card'
              input[:conditions] = { level: input[:level] }
              input[:info] = { type: input[:type], recall: input[:recall] }.compact
            end

            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result = ::Daggerheart::Feat.create!(input.except(:limit, :no_refresh, :subclass_mastery, :level, :attacks))

            if input.key?(:attacks)
              input[:attacks].each do |attack|
                add_weapon_command.call(attack.merge(user: input[:user], itemable: result))
              end
            end

            unless input.key?(:no_refresh)
              input[:user].characters.daggerheart.find_each { |character| refresh_feats.call(character: character) }
            end

            { result: result }
          end

          def add_weapon_command = HomebrewsV2Context::Import::Daggerheart::Items::Weapons::AddCommand.new
        end
      end
    end
  end
end
