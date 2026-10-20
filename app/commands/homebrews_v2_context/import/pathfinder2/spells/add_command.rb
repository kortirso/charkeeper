# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Spells
        class AddCommand < BaseCommand
          # rubocop: disable-next Metrics/BlockLength
          use_contract do
            params do
              required(:user).filled(type?: ::User)
              optional(:id).filled(:string, :uuid_v4?)
              required(:title).hash do
                required(:en).filled(:string, max_size?: 50)
                optional(:ru).maybe(:string, max_size?: 50)
                optional(:es).maybe(:string, max_size?: 50)
              end
              required(:description).hash do
                required(:en).filled(:string, max_size?: 2_000)
                optional(:ru).maybe(:string, max_size?: 2_000)
                optional(:es).maybe(:string, max_size?: 2_000)
              end
              optional(:origin_value).maybe(:string)
              required(:origin_values).filled(:array).each(:string)
              optional(:public).filled(:bool)
              required(:info).hash do
                required(:level).filled(:integer, gteq?: 0)
                optional(:range).filled(:string)
                optional(:defense).filled(:string)
                optional(:area).filled(:string)
                optional(:time).filled(:string)
                optional(:duration).filled(:string)
                optional(:sustained).filled(:bool)
              end
              optional(:price).hash do
                optional(:a).filled(:integer, gteq?: 1, lteq?: 3)
                optional(:r).filled(:integer, gteq?: 1, lteq?: 3)
              end
            end
          end

          private

          def validate_content(input)
            return unless input.key?(:id)

            input[:spell] = ::Pathfinder2::Feat.find_by(user_id: input[:user].id, id: input[:id])
            return if input[:spell]

            ['Not found']
          end

          def do_prepare(input)
            input[:slug] = input.dig(:title, :en)&.downcase&.tr(' ', '_') || SecureRandom.uuid unless input.key?(:id)
            input[:origin] = 'spell'
            input[:origin_value] ||= ''
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
                ::Pathfinder2::Feat.create!(input.except(:id))
              end

            { result: result }
          end
        end
      end
    end
  end
end
