# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Spells
        class AddCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            Times = Dry::Types['strict.string'].enum('A', 'BA', 'R', '1,m', '10,m', '1,h', '8,h', '12,h', '24,h')
            Schools = Dry::Types['strict.string'].enum(
              'enchantment', 'conjuration', 'evocation', 'abjuration', 'illusion', 'divination', 'necromancy', 'transmutation'
            )
            Dcs = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'wis', 'int', 'cha')

            params do
              required(:user).filled(type?: ::User)
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
              required(:origin_values).filled(:array).each(:string)
              optional(:public).filled(:bool)
              required(:info).hash do
                required(:level).filled(:integer, gteq?: 0)
                required(:time).filled(Times)
                required(:school).filled(Schools)
                required(:range).filled(:string)
                optional(:area).filled(:string)
                optional(:duration).filled(:string)
                optional(:components).filled(:string)
                optional(:hit).filled(:bool)
                optional(:dc).maybe(Dcs)
                optional(:concentration).filled(:bool)
                optional(:ritual).filled(:bool)
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input)
            return unless input.key?(:id)

            input[:spell] = ::Dnd2024::Feat.find_by(user_id: input[:user].id, id: input[:id])
            return if input[:spell]

            ['Not found']
          end

          def do_prepare(input)
            input[:slug] = SecureRandom.uuid unless input.key?(:id)
            input[:origin] = 'spell'
            input[:kind] = 'static'
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            result =
              if input[:spell]
                input[:spell].update!(input.except(:id))
                input[:spell].reload
              else
                ::Dnd2024::Feat.create!(input.except(:id))
              end

            { result: result }
          end
        end
      end
    end
  end
end
