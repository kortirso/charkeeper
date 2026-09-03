# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Cultures
        class PerformCommand < BaseCommand
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
                required(:en).filled(:string, max_size?: 500)
                optional(:ru).maybe(:string, max_size?: 500)
                optional(:es).maybe(:string, max_size?: 500)
              end
              optional(:only).maybe(:array, min_size?: 1).each(:string)
              optional(:public).filled(:bool)
            end
          end

          private

          def validate_content(input)
            if input.key?(:id)
              input[:culture] = ::Cosmere::Homebrews::Culture.find_by(user_id: input[:user].id, id: input[:id])
              return ['Not found'] unless input[:culture]
            end

            nil
          end

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:only)
          end

          def do_persist(input)
            command =
              if input[:culture]
                HomebrewsV2Context::Import::Cosmere::Cultures::ChangeCommand.new
              else
                HomebrewsV2Context::Import::Cosmere::Cultures::AddCommand.new
              end
            command.call(input)
          end
        end
      end
    end
  end
end
