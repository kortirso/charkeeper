# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Subclasses
        class PerformCommand < BaseCommand
          # rubocop: disable Metrics/BlockLength
          use_contract do
            Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden', 'static_list', 'many_from_list')
            Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

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
              required(:class_id).filled(:string)
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
                optional(:limit).filled(:integer, gteq?: 0, lteq?: 20)
                optional(:limit_refresh).filled(Limits)
                optional(:modifiers).hash
                optional(:continious).filled(:bool)
                optional(:level).filled(:integer, gteq?: 1, lteq?: 20)
                optional(:static_spells).hash
              end
            end
          end
          # rubocop: enable Metrics/BlockLength

          private

          def validate_content(input)
            return unless input.key?(:id)

            input[:subclass] = ::Dnd2024::Homebrews::Subclass.find_by(user_id: input[:user].id, id: input[:id])
            return if input[:subclass]

            ['Not found']
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = { class_id: sanitize(input[:class_id]) }
          end

          def do_persist(input)
            command =
              if input[:subclass]
                HomebrewsV2Context::Import::Dnd2024::Subclasses::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Dnd2024::Subclasses::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
