# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Ancestries
        class PerformCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden', 'static_list', 'many_from_list')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'session')
            WeaponKinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon')
            Traits = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')
            Ranges = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far', 'very far')
            DamageTypes = Dry::Types['strict.string'].enum('physical', 'magic')
            Damages = Dry::Types['strict.string'].enum('d4', 'd6', 'd8', 'd10', 'd12', 'd20')
            Dices = Dry::Types['strict.string'].enum('D4', 'D6', 'D8', 'D10', 'D12', 'D20')

            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:public).filled(:bool)
              optional(:features).maybe(:array).each(:hash) do
                optional(:id).filled(:string, :uuid_v4?)
                required(:title).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 1_000)
                  optional(:ru).maybe(:string, max_size?: 1_000)
                  optional(:es).maybe(:string, max_size?: 1_000)
                end
                required(:kind).filled(Kinds)
                optional(:limit).filled(:integer, gteq?: 0)
                optional(:limit_refresh).filled(Limits)
                optional(:modifiers).hash
                optional(:continious).filled(:bool)
                optional(:tokens).hash do
                  optional(:limit).filled(:string)
                  optional(:reset_at).filled(:string)
                  optional(:reset).filled(:string)
                end
                optional(:price).hash do
                  optional(:stress).filled(:integer, gteq?: 1, lteq?: 10)
                  optional(:hope).filled(:integer, gteq?: 1, lteq?: 10)
                end
                optional(:hope_dice).filled(Dices)
                optional(:fear_dice).filled(Dices)
                optional(:attacks).maybe(:array).each(:hash) do
                  required(:kind).filled(WeaponKinds)
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
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input)
            return unless input.key?(:id)

            input[:ancestry] = ::Daggerheart::Homebrews::Ancestry.find_by(user_id: input[:user].id, id: input[:id])
            return if input[:ancestry]

            ['Not found']
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            command =
              if input[:ancestry]
                HomebrewsV2Context::Import::Daggerheart::Ancestries::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Daggerheart::Ancestries::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
