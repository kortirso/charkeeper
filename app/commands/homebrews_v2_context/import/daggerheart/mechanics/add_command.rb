# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Mechanics
        class AddCommand < BaseCommand
          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              mechanic = ::Daggerheart::Homebrews::Mechanic.create!(input.slice(:user, :title, :description, :public))
              add_command = HomebrewsV2Context::Import::Daggerheart::MechanicItems::AddCommand.new
              input[:items]&.each do |item|
                add_command.call(item.except(:id).merge(homebrew_id: mechanic.id, user: input[:user]))
              end
              mechanic
            end

            { result: result }
          end
        end
      end
    end
  end
end
