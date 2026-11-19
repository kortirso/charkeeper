# frozen_string_literal: true

require 'tailwindcss/ruby'

module TailwindBundles
  BUNDLES = {
    rails: ['app/assets/tailwind/rails.css', 'app/assets/builds/tailwind_rails.css'],
    v2: ['app/assets/tailwind/v2.css', 'app/assets/builds/tailwind_v2.css']
  }.freeze

  module_function

  def run(name, watch: false)
    input, output = BUNDLES.fetch(name)
    command = [Tailwindcss::Ruby.executable, '-i', Rails.root.join(input).to_s, '-o', Rails.root.join(output).to_s]
    command.push('-w', 'always') if watch
    command << '--minify' unless watch || Rails.env.local?

    system(*command, exception: !watch)
  end
end

namespace :tailwindcss do
  desc 'Build the shared Rails and V2 Tailwind bundles'
  task build_extra: :environment do
    TailwindBundles::BUNDLES.each_key { |name| TailwindBundles.run(name) }
  end

  desc 'Watch the shared Rails Tailwind bundle'
  task watch_rails: :environment do
    TailwindBundles.run(:rails, watch: true)
  rescue Interrupt
    puts 'Received interrupt, exiting tailwindcss:watch_rails'
  end

  desc 'Watch the V2 Tailwind bundle'
  task watch_v2: :environment do
    TailwindBundles.run(:v2, watch: true)
  rescue Interrupt
    puts 'Received interrupt, exiting tailwindcss:watch_v2'
  end
end

Rake::Task['assets:precompile'].enhance(['tailwindcss:build_extra'])

if Rake::Task.task_defined?('test:prepare')
  Rake::Task['test:prepare'].enhance(['tailwindcss:build_extra'])
elsif Rake::Task.task_defined?('spec:prepare')
  Rake::Task['spec:prepare'].enhance(['tailwindcss:build_extra'])
elsif Rake::Task.task_defined?('db:test:prepare')
  Rake::Task['db:test:prepare'].enhance(['tailwindcss:build_extra'])
end
